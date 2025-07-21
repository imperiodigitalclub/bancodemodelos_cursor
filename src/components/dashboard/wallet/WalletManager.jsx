import React, { useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletState } from './hooks/useWalletState';
import { useWalletData } from './hooks/useWalletData';
import { useWalletPreferences } from './hooks/useWalletPreferences';

export const useWalletManager = () => {
    const { user, refreshAuthUser } = useAuth();
    
    const stateAndSetters = useWalletState();
    const [paymentType, setPaymentType] = useState('wallet_deposit');
    const [externalReferenceId, setExternalReferenceId] = useState(null);

    const dataHooks = useWalletData(user, stateAndSetters);
    const preferencesHooks = useWalletPreferences(user, stateAndSetters, stateAndSetters);

    return {
        ...stateAndSetters,
        ...dataHooks,
        ...preferencesHooks,
        refreshAuthUser,
        paymentType,
        setPaymentType,
        externalReferenceId,
        setExternalReferenceId,
    };
};