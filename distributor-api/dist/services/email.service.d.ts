import { EmailNotification } from '@/types';
declare class EmailService {
    private transporter;
    constructor();
    private initializeTransporter;
    sendEmail(notification: EmailNotification): Promise<boolean>;
    private generateEmailTemplate;
    private applicationSubmittedTemplate;
    private applicationStatusUpdatedTemplate;
    private applicationApprovedTemplate;
    private applicationRejectedTemplate;
    private defaultTemplate;
    private getStatusText;
    private getStatusColor;
    notifyApplicationSubmitted(applicationData: any): Promise<void>;
    notifyApplicationStatusUpdate(applicationData: any): Promise<void>;
}
declare const emailService: EmailService;
export default emailService;
//# sourceMappingURL=email.service.d.ts.map