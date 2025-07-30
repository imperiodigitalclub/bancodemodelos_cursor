import React from 'react';
import AdminPaymentsConfig from '@/components/pages/admin/tabs/AdminPaymentsConfig';
import AdminPaymentsHistory from '@/components/pages/admin/tabs/AdminPaymentsHistory';

const AdminPaymentsTab = ({ part }) => {
    return (
        <div className="space-y-6">
            {part === 'config' && <AdminPaymentsConfig />}
            {part === 'history' && <AdminPaymentsHistory />}
        </div>
    );
};

export default AdminPaymentsTab;