import { EmailNotification } from '../types';
declare class MailjetEmailService {
    private mailjet;
    constructor();
    private initializeMailjet;
    sendEmail(notification: EmailNotification): Promise<boolean>;
    private generateEmailTemplate;
    private generateTextTemplate;
    private distributorApprovedTemplate;
    private distributorApprovedWithCredentialsTemplate;
    private distributorOfferLetterTemplate;
    private defaultTemplate;
    notifyDistributorApproved(applicationData: any, credentials?: any): Promise<void>;
    sendDistributorOfferLetter(applicationData: any, products: any[], additionalData?: any): Promise<void>;
}
declare const mailjetEmailService: MailjetEmailService;
export default mailjetEmailService;
//# sourceMappingURL=mailjet.service.d.ts.map