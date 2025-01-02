export interface ClerkEmailAddress {
    email_address: string;
    id: string;
    linked_to: any[];
    object: string;
    verification: {
      status: string;
      strategy: string;
    };
  }
  
  export interface ClerkUserData {
    id: string;
    object: string;
    external_id: string | null;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    email_addresses: ClerkEmailAddress[];
    primary_email_address_id: string;
    avatar_url: string;
    created_at: number;
    updated_at: number;
  }
  
  export interface ClerkWebhookEvent {
    data: ClerkUserData;
    object: 'event';
    type: 'user.created' | 'user.updated' | 'user.deleted';
  }