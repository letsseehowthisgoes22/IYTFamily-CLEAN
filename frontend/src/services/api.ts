const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export interface Trip {
  id: string;
  client_id: string;
  staff_id: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  origin_address: string;
  destination_address: string;
  scheduled_start: string;
  actual_start?: string;
  scheduled_end?: string;
  actual_end?: string;
  transport_mode: 'driving' | 'flying';
  vehicle_info?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
  };
  staff?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface TripCreate {
  client_id: string;
  origin_address: string;
  destination_address: string;
  scheduled_start: string;
  scheduled_end?: string;
  transport_mode: 'driving' | 'flying';
  vehicle_info?: string;
  notes?: string;
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

export interface Message {
  id: string;
  trip_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'system' | 'alert';
  created_at: string;
  sender?: {
    first_name: string;
    last_name: string;
    role: string;
  };
}

export interface Document {
  id: string;
  trip_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

export const tripAPI = {
  getTrips: async (): Promise<Trip[]> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/trips/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch trips: ${response.statusText}`);
    }
    return response.json();
  },

  getTripDetails: async (tripId: string): Promise<Trip> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/trips/${tripId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch trip details: ${response.statusText}`);
    }
    return response.json();
  },

  createTrip: async (tripData: TripCreate): Promise<Trip> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/trips/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tripData)
    });
    if (!response.ok) {
      throw new Error(`Failed to create trip: ${response.statusText}`);
    }
    return response.json();
  },

  startTrip: async (tripId: string): Promise<{ message: string; trip: Trip }> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/trips/${tripId}/start`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to start trip: ${response.statusText}`);
    }
    return response.json();
  },

  completeTrip: async (tripId: string): Promise<{ message: string; trip: Trip }> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/trips/${tripId}/complete`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to complete trip: ${response.statusText}`);
    }
    return response.json();
  },

  updateTrip: async (tripId: string, tripData: Partial<TripCreate>): Promise<Trip> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/trips/${tripId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(tripData)
    });
    if (!response.ok) {
      throw new Error(`Failed to update trip: ${response.statusText}`);
    }
    return response.json();
  }
};

export const locationAPI = {
  updateLocation: async (tripId: string, location: LocationUpdate): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/locations/trips/${tripId}/location`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(location)
    });
    if (!response.ok) {
      throw new Error(`Failed to update location: ${response.statusText}`);
    }
  },

  getCurrentLocation: async (tripId: string): Promise<LocationUpdate> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/locations/trips/${tripId}/location/current`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to get current location: ${response.statusText}`);
    }
    return response.json();
  },

  getLocationHistory: async (tripId: string): Promise<LocationUpdate[]> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/locations/trips/${tripId}/location/history`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to get location history: ${response.statusText}`);
    }
    return response.json();
  }
};

export const messageAPI = {
  getMessages: async (tripId: string): Promise<Message[]> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/messages/trips/${tripId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.statusText}`);
    }
    return response.json();
  },

  sendMessage: async (tripId: string, content: string): Promise<Message> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/messages/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        trip_id: tripId,
        content,
        message_type: 'text'
      })
    });
    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }
    return response.json();
  }
};

export const documentAPI = {
  getDocuments: async (tripId: string): Promise<Document[]> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/trips/${tripId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.statusText}`);
    }
    return response.json();
  },

  uploadDocument: async (tripId: string, file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('trip_id', tripId);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    if (!response.ok) {
      throw new Error(`Failed to upload document: ${response.statusText}`);
    }
    return response.json();
  },

  downloadDocument: async (documentId: string): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/${documentId}/download`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to download document: ${response.statusText}`);
    }
    return response.blob();
  },

  deleteDocument: async (documentId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/${documentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to delete document: ${response.statusText}`);
    }
  }
};

export const userAPI = {
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch current user: ${response.statusText}`);
    }
    return response.json();
  },

  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    return response.json();
  },

  createUser: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }
    return response.json();
  },

  updateUser: async (userId: string, userData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.statusText}`);
    }
    return response.json();
  },

  disableUser: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}/disable`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to disable user: ${response.statusText}`);
    }
    return response.json();
  }
};

export const flightAPI = {
  getFlightInfo: async (tripId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/flights/trips/${tripId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch flight info: ${response.statusText}`);
    }
    return response.json();
  },

  updateFlightInfo: async (tripId: string, flightData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/flights/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        trip_id: tripId,
        ...flightData
      })
    });
    if (!response.ok) {
      throw new Error(`Failed to update flight info: ${response.statusText}`);
    }
    return response.json();
  }
};

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_notes?: string;
  family_user_id?: string;
  created_at: string;
  updated_at: string;
  family_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
}

export interface ClientCreate {
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_notes?: string;
  family_user_id?: string;
}

export const clientAPI = {
  getClients: async (): Promise<Client[]> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/clients/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch clients: ${response.statusText}`);
    }
    return response.json();
  },

  getClient: async (clientId: string): Promise<Client> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/clients/${clientId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch client: ${response.statusText}`);
    }
    return response.json();
  },

  createClient: async (clientData: ClientCreate): Promise<Client> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/clients/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(clientData)
    });
    if (!response.ok) {
      throw new Error(`Failed to create client: ${response.statusText}`);
    }
    return response.json();
  },

  updateClient: async (clientId: string, clientData: Partial<ClientCreate>): Promise<Client> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/clients/${clientId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(clientData)
    });
    if (!response.ok) {
      throw new Error(`Failed to update client: ${response.statusText}`);
    }
    return response.json();
  },

  assignClientToFamily: async (clientId: string, familyUserId: string): Promise<{ message: string; client: Client }> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/clients/${clientId}/assign-family`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ family_user_id: familyUserId })
    });
    if (!response.ok) {
      throw new Error(`Failed to assign client: ${response.statusText}`);
    }
    return response.json();
  },

  unassignClientFromFamily: async (clientId: string): Promise<{ message: string; client: Client }> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/clients/${clientId}/unassign-family`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to unassign client: ${response.statusText}`);
    }
    return response.json();
  },

  getUnassignedClients: async (): Promise<Client[]> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/clients/unassigned/list`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch unassigned clients: ${response.statusText}`);
    }
    return response.json();
  }
};

export const handleApiError = (error: any, action: string) => {
  console.error(`Failed to ${action}:`, error);
  
  if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
    localStorage.removeItem('token');
    window.location.reload();
    return;
  }
  
  throw new Error(`Failed to ${action}. Please try again.`);
};
