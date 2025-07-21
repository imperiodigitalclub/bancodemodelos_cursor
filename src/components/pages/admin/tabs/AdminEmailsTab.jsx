import React from 'react';
import SmtpSettings from '@/components/pages/admin/tabs/emails/SmtpSettings';
import EmailTemplates from '@/components/pages/admin/tabs/emails/EmailTemplates';

const AdminEmailsTab = () => {
  return (
    <div className="space-y-8">
      <SmtpSettings />
      <EmailTemplates />
    </div>
  );
};

export default AdminEmailsTab;