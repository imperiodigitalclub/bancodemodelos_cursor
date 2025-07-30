import React, { useState } from 'react';

export const useWalletState = () => {
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(true); 
    const [isLoadingPreference, setIsLoadingPreference] = useState(false);
    const [isLoadingPixPayment, setIsLoadingPixPayment] = useState(false);
    const [preferenceId, setPreferenceId] = useState(null);
    const [paymentAttemptId, setPaymentAttemptId] = useState(null);
    const [paymentError, setPaymentError] = useState(null);
    const [currentAmountForBrick, setCurrentAmountForBrick] = useState(0);
    const [pendingTransactionToRepay, setPendingTransactionToRepay] = useState(null);
    const [isCheckingStatusManually, setIsCheckingStatusManually] = useState(false);
    const [mercadoPagoPublicKey, setMercadoPagoPublicKey] = useState(null);
    const [paymentMethodSettings, setPaymentMethodSettings] = useState({
        PAYMENT_METHOD_CREDIT_CARD: true,
        PAYMENT_METHOD_BOLETO: true,
        PAYMENT_METHOD_PIX: true,
    });
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false); // Added for global modal control
    
    return {
        transactions, setTransactions,
        loadingTransactions, setLoadingTransactions,
        isLoadingPreference, setIsLoadingPreference,
        isLoadingPixPayment, setIsLoadingPixPayment,
        preferenceId, setPreferenceId,
        paymentAttemptId, setPaymentAttemptId,
        paymentError, setPaymentError,
        currentAmountForBrick, setCurrentAmountForBrick,
        pendingTransactionToRepay, setPendingTransactionToRepay,
        isCheckingStatusManually, setIsCheckingStatusManually,
        mercadoPagoPublicKey, setMercadoPagoPublicKey,
        paymentMethodSettings, setPaymentMethodSettings,
        initialLoadComplete, setInitialLoadComplete,
        hasMoreTransactions, setHasMoreTransactions,
        currentPage, setCurrentPage,
        isDepositModalOpen, setIsDepositModalOpen, 
    };
};