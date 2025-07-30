import React from 'react';

export const PIX_KEY_TYPES = [
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'email', label: 'E-mail' },
  { value: 'phone', label: 'Celular (formato +55XX999999999)' },
  { value: 'random', label: 'Chave Aleatória' },
];

export const DOCUMENT_TYPES = [
    { value: 'cnh_frente_verso', label: 'CNH (Frente e Verso)', files: 2 },
    { value: 'rg_frente_verso', label: 'RG (Frente e Verso)', files: 2 },
    { value: 'passaporte', label: 'Passaporte (Página de Identificação)', files: 1 },
    { value: 'rg_unico', label: 'RG (Documento Único com Frente e Verso)', files: 1 },
];

export const formatCPF = (value) => {
    if (!value) return '';
    const cpf = value.replace(/\D/g, ''); 
    if (cpf.length <= 3) return cpf;
    if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
    if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
};

export const formatCNPJ = (value) => {
    if (!value) return '';
    const cnpj = value.replace(/\D/g, '');
    if (cnpj.length <= 2) return cnpj;
    if (cnpj.length <= 5) return `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`;
    if (cnpj.length <= 8) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`;
    if (cnpj.length <= 12) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8)}`;
    return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12, 14)}`;
};

export const formatPhone = (value) => {
    if (!value) return '';
    let phone = value.replace(/\D/g, '');
    
    if (phone.startsWith('55') && phone.length > 2) { // Common international format for Brazil
        phone = phone.substring(2);
    } else if (phone.startsWith('+55') && phone.length > 3) {
        phone = phone.substring(3);
    }

    if (phone.length <= 2) return `(${phone}`;
    if (phone.length <= 6) return `(${phone.slice(0, 2)}) ${phone.slice(2)}`;
    if (phone.length <= 10) return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7, 11)}`; // (XX) XXXXX-XXXX
};


export const formatPixKey = (key, type) => {
    if (!key || !type) return key;
    switch (type) {
        case 'cpf':
            return formatCPF(key);
        case 'cnpj':
            return formatCNPJ(key);
        case 'phone':
            return formatPhone(key);
        case 'email':
        case 'random':
        default:
            return key;
    }
};

export const validatePixKey = (key, type, cpfValue = null) => {
    const trimmedKey = key.trim();
    const rawKey = trimmedKey.replace(/\D/g, '');

    if (!trimmedKey) return 'Chave PIX é obrigatória.';

    switch (type) {
        case 'cpf':
            if (rawKey.length !== 11) return 'Chave PIX (CPF) deve ter 11 dígitos.';
            if (cpfValue && rawKey !== cpfValue.replace(/\D/g, '')) return 'Chave PIX (CPF) deve ser igual ao CPF informado no cadastro.';
            return null;
        case 'cnpj':
            if (rawKey.length !== 14) return 'Chave PIX (CNPJ) deve ter 14 dígitos.';
            return null;
        case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedKey)) return 'Formato de e-mail inválido para chave PIX.';
            return null;
        case 'phone':
            // Expects something like +5511987654321 or 11987654321
            // Basic validation for Brazil: (optional +55) + 2 DDD + 8 or 9 digits
            const phoneDigits = trimmedKey.replace(/\D/g, '');
            let effectivePhone = phoneDigits;
            if (phoneDigits.startsWith('55') && phoneDigits.length > 2) {
                effectivePhone = phoneDigits.substring(2);
            }
            if (!/^\d{10,11}$/.test(effectivePhone)) return 'Formato de telefone inválido. Use (XX) XXXXX-XXXX ou (XX) XXXX-XXXX (sem +55).';
            return null;
        case 'random':
            if (trimmedKey.length < 10 || trimmedKey.length > 77) return 'Chave aleatória inválida (muito curta ou longa).'; // Basic length check
            return null;
        default:
            return 'Tipo de chave PIX inválido.';
    }
};


export const validateVerificationForm = (formData, existingVerification) => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Nome completo é obrigatório.';
    
    if (!formData.birth_date) {
        newErrors.birth_date = 'Data de nascimento é obrigatória.';
    } else {
      const today = new Date();
      const birthDate = new Date(formData.birth_date);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        newErrors.birth_date = 'Você deve ser maior de 18 anos.';
      }
    }

    if (!formData.document_type) newErrors.document_type = 'Tipo de documento é obrigatório.';
    
    const selectedDocType = DOCUMENT_TYPES.find(dt => dt.value === formData.document_type);

    if (!formData.document_front && !existingVerification?.document_front_image_url) {
        newErrors.document_front = selectedDocType?.files === 1 ? 'Documento (imagem única) é obrigatório.' : 'Frente do documento é obrigatória.';
    }
    if (formData.document_front && formData.document_front.size > 5 * 1024 * 1024) { // 5MB limit
        newErrors.document_front = 'Arquivo da frente do documento muito grande (máx 5MB).';
    }

    if (selectedDocType?.files === 2 && !formData.document_back && !existingVerification?.document_back_image_url) {
        newErrors.document_back = 'Verso do documento é obrigatório.';
    }
    if (formData.document_back && formData.document_back.size > 5 * 1024 * 1024) { // 5MB limit
        newErrors.document_back = 'Arquivo do verso do documento muito grande (máx 5MB).';
    }

    if (!formData.document_selfie && !existingVerification?.document_selfie_url) {
        newErrors.document_selfie = 'Selfie segurando o documento é obrigatória.';
    }
    if (formData.document_selfie && formData.document_selfie.size > 5 * 1024 * 1024) { // 5MB limit
        newErrors.document_selfie = 'Arquivo da selfie muito grande (máx 5MB).';
    }
    
    const cpfValue = formData.cpf.replace(/\D/g, '');
    if (!cpfValue) {
        newErrors.cpf = 'CPF é obrigatório.';
    } else if (cpfValue.length !== 11) {
        newErrors.cpf = 'CPF deve conter 11 dígitos.';
    } else if (!/^\d{11}$/.test(cpfValue)) {
        newErrors.cpf = 'CPF inválido. Use apenas números.';
    }


    if (!formData.pix_key_type) newErrors.pix_key_type = 'Tipo da chave PIX é obrigatório.';
    
    const pixKeyError = validatePixKey(formData.pix_key, formData.pix_key_type, cpfValue);
    if (pixKeyError) {
        newErrors.pix_key = pixKeyError;
    }
    
    return newErrors;
};