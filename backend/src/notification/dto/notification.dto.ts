import { RequestStatus } from 'src/requests/requests.enum';

type NotificationType = 'request_updated' | 'request_new' | 'request_deleted';

export interface NotificationPayloadDTO {
  type: NotificationType;
  requestId: string;
  newStatus: RequestStatus;
}
