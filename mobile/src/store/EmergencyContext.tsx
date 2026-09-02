import React, { createContext, useState, useContext, useEffect } from 'react';
import { Emergency, EmergencyMessage } from '../types/index';
import { api } from '../services/api';
import { locationService } from '../services/location';
import { socketService } from '../services/socket';
import { useAuth } from './AuthContext';
import { showAlert, showConfirm } from '../utils/alert';

interface EmergencyContextType {
  activeEmergency: Emergency | null;
  nearbyRequests: Emergency[];
  messages: EmergencyMessage[];
  isTriggering: boolean;
  triggerSOS: (description?: string, customAddress?: string) => Promise<Emergency>;
  acceptRequest: (incidentId: string) => Promise<void>;
  cancelEmergency: (incidentId: string) => Promise<void>;
  resolveEmergency: (incidentId: string) => Promise<void>;
  fetchNearbyRequests: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  refreshActiveEmergency: () => Promise<void>;
}

const EmergencyContext = createContext<EmergencyContextType>({} as EmergencyContextType);

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeEmergency, setActiveEmergency] = useState<Emergency | null>(null);
  const [nearbyRequests, setNearbyRequests] = useState<Emergency[]>([]);
  const [messages, setMessages] = useState<EmergencyMessage[]>([]);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);

  const fetchNearbyRequests = async () => {
    try {
      const res = await api.get('/emergencies/nearby');
      if (res.data?.success) {
        setNearbyRequests(res.data.data);
      }
    } catch (e) {
      console.warn('[EmergencyContext] Could not fetch nearby requests:', e);
    }
  };

  const refreshActiveEmergency = async () => {
    if (!activeEmergency?._id) return;
    try {
      const res = await api.get(`/emergencies/${activeEmergency._id}`);
      if (res.data?.success) {
        setActiveEmergency(res.data.data);
      }
    } catch (e) {
      console.warn('[EmergencyContext] Could not refresh emergency:', e);
    }
  };

  // Socket event subscriptions
  useEffect(() => {
    if (!user) return;

    const handlePushNotification = (data: any) => {
      console.log('[Socket Push Received]', data);
      fetchNearbyRequests();

      const incidentId = data?.data?.incidentId || data?.incidentId;
      const requesterId = data?.data?.requesterId || data?.requesterId;
      const title = data?.title || '🚨 EMERGENCY ASSISTANCE NEEDED';
      const body = data?.body || 'A user near you needs immediate emergency assistance.';

      // Check if current user is the requester of this emergency incident
      const currentUserId = user?._id || (user as any)?.id;
      const isRequester =
        (requesterId && currentUserId && requesterId.toString() === currentUserId.toString()) ||
        (activeEmergency && activeEmergency._id === incidentId && (
          activeEmergency.requesterId === currentUserId ||
          (activeEmergency.requesterId as any)?._id === currentUserId
        ));

      if (isRequester) {
        console.log('[EmergencyContext] Suppressing SOS accept prompt for requester user');
        return;
      }

      if (incidentId && (title.includes('EMERGENCY') || title.includes('ASSISTANCE'))) {
        showConfirm(
          title,
          `${body}\n\nWould you like to accept this emergency request and respond to assist?`,
          async () => {
            try {
              await acceptRequest(incidentId);
            } catch (err: any) {
              showAlert('Error', err.message || 'Could not accept emergency request.');
            }
          },
          'ACCEPT & RESPOND',
          'DECLINE'
        );
      } else {
        showAlert(title, body);
      }
    };

    const handleChatMessage = (newMessage: EmergencyMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    };

    const attachSocketListeners = () => {
      const socket = socketService.getSocket();
      if (socket) {
        socket.off('notification:push', handlePushNotification);
        socket.off('chat:message', handleChatMessage);
        socket.on('notification:push', handlePushNotification);
        socket.on('chat:message', handleChatMessage);
      }
    };

    attachSocketListeners();
    const interval = setInterval(attachSocketListeners, 3000);

    return () => {
      clearInterval(interval);
      socketService.off('notification:push', handlePushNotification);
      socketService.off('chat:message', handleChatMessage);
    };
  }, [user]);

  const fetchMyActiveEmergency = async () => {
    if (!user) return;
    try {
      const res = await api.get('/emergencies/active/my');
      if (res.data?.success && res.data.data) {
        const incident = res.data.data;
        setActiveEmergency(incident);
        if (incident?._id) {
          socketService.joinEmergencyRoom(incident._id);
        }
      }
    } catch (e) {
      console.warn('[EmergencyContext] Could not fetch my active emergency:', e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyActiveEmergency();
    }
  }, [user]);

  const triggerSOS = async (description?: string, customAddress?: string): Promise<Emergency> => {
    setIsTriggering(true);
    try {
      const coords = await locationService.getCurrentCoordinates();
      if (!coords) throw new Error('Location permission is required to trigger emergency request');

      let address = customAddress;
      if (!address) {
        address = await locationService.getAddressFromCoordinates(coords.latitude, coords.longitude);
      }

      const res = await api.post('/emergencies', {
        latitude: coords.latitude,
        longitude: coords.longitude,
        addressDescription: address,
        description: description || '🆘 NEED IMMEDIATE ASSISTANCE',
        severity: 'high',
      });

      if (res.data?.success) {
        const incident = res.data.data.emergency;
        setActiveEmergency(incident);
        socketService.joinEmergencyRoom(incident._id);
        return incident;
      }
      throw new Error(res.data?.message || 'Failed to trigger emergency');
    } catch (err: any) {
      const serverMessage = err.response?.data?.message;
      if (serverMessage) {
        err.message = serverMessage;
      }
      throw err;
    } finally {
      setIsTriggering(false);
    }
  };

  const acceptRequest = async (incidentId: string) => {
    try {
      const res = await api.post(`/emergencies/${incidentId}/accept`);
      if (res.data?.success) {
        const incident = res.data.data.emergency;
        setActiveEmergency(incident);
        socketService.joinEmergencyRoom(incident._id);
        await fetchNearbyRequests();
      } else {
        throw new Error(res.data?.message || 'Failed to accept emergency request');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Could not accept emergency request';
      console.error('[EmergencyContext] Accept emergency error:', msg);
      throw new Error(msg);
    }
  };

  const cancelEmergency = async (incidentId: string) => {
    try {
      const res = await api.post(`/emergencies/${incidentId}/cancel`);
      if (res.data?.success) {
        socketService.leaveEmergencyRoom(incidentId);
        setActiveEmergency(null);
        setMessages([]);
      } else {
        throw new Error(res.data?.message || 'Failed to cancel emergency');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Could not cancel emergency request';
      console.error('[EmergencyContext] Cancel emergency error:', msg);
      throw new Error(msg);
    }
  };

  const resolveEmergency = async (incidentId: string) => {
    try {
      const res = await api.patch(`/emergencies/${incidentId}/status`, {
        status: 'resolved',
        reason: 'Assistance completed safely.',
      });
      if (res.data?.success) {
        socketService.leaveEmergencyRoom(incidentId);
        setActiveEmergency(null);
        setMessages([]);
      } else {
        throw new Error(res.data?.message || 'Failed to resolve emergency');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Could not resolve emergency request';
      console.error('[EmergencyContext] Resolve emergency error:', msg);
      throw new Error(msg);
    }
  };

  const sendMessage = async (content: string) => {
    if (!activeEmergency?._id || !content.trim()) return;
    socketService.sendChatMessage(activeEmergency._id, content);
  };

  return (
    <EmergencyContext.Provider
      value={{
        activeEmergency,
        nearbyRequests,
        messages,
        isTriggering,
        triggerSOS,
        acceptRequest,
        cancelEmergency,
        resolveEmergency,
        fetchNearbyRequests,
        sendMessage,
        refreshActiveEmergency,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => useContext(EmergencyContext);
