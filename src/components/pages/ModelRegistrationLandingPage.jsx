
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertTriangle } from 'lucide-react';
import ModelRegistrationForm from '@/components/pages/model-landing/ModelRegistrationForm';
import WebFont from 'webfontloader';

const ModelRegistrationLandingPage = () => {
    const { user } = useAuth();
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPageData = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error: dbError } = await supabase
                .from('landing_pages')
                .select('content, is_published')
                .eq('slug', 'criar-modelo')
                .single();

            if (dbError) throw dbError;

            if (data && data.is_published) {
                setPageData(data.content);
                 // Load fonts
                const fontsToLoad = [];
                if (data.content?.headline?.font_family && !['Arial, sans-serif', 'Verdana, sans-serif', 'Georgia, serif'].includes(data.content.headline.font_family)) {
                    fontsToLoad.push(data.content.headline.font_family.split(',')[0].replace(/'/g, ''));
                }
                if (data.content?.subheadline?.font_family && !['Arial, sans-serif', 'Verdana, sans-serif', 'Georgia, serif'].includes(data.content.subheadline.font_family)) {
                     fontsToLoad.push(data.content.subheadline.font_family.split(',')[0].replace(/'/g, ''));
                }

                if (fontsToLoad.length > 0) {
                    WebFont.load({
                        google: {
                            families: [...new Set(fontsToLoad)] // Unique fonts
                        }
                    });
                }
            } else {
                setError("Página não encontrada ou não está publicada.");
            }
        } catch (err) {
            console.error("Erro ao carregar a landing page:", err);
            setError("Não foi possível carregar a página.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);
    
    if (loading) {
        return (
            <div className="w-full min-h-screen flex justify-center items-center bg-gray-100">
                <Loader2 className="h-12 w-12 animate-spin text-pink-600" />
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="w-full min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Oops! Algo deu errado.</h2>
                <p className="text-gray-600 mt-2">{error}</p>
            </div>
        );
    }

    if (user) {
        return (
             <div className="w-full min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Você já está logado!</h2>
                <p className="text-gray-600 mt-2">Não é necessário se cadastrar novamente.</p>
            </div>
        )
    }
    
    const { 
        logo = {}, 
        headline = {}, 
        subheadline = {},
        background = {},
        form_style = {},
    } = pageData || {};

    const backgroundStyle = background.type === 'image' 
        ? { backgroundImage: `url(${background.value})` } 
        : { backgroundColor: background.value || '#F9FAFB' };
    const backgroundClasses = background.type === 'image' ? 'bg-cover bg-center' : '';

    const headlineStyle = {
        fontFamily: headline.font_family || "'Poppins', sans-serif",
        fontWeight: headline.font_weight || 'bold',
        color: headline.color || '#111827',
    };
    
    const subheadlineStyle = {
        fontFamily: subheadline.font_family || "'Poppins', sans-serif",
        fontWeight: subheadline.font_weight || 'normal',
        color: subheadline.color || '#4B5563',
    };


    return (
        <div 
            className={`min-h-screen w-full flex flex-col items-center p-4 sm:p-6 lg:p-8 ${backgroundClasses}`}
            style={backgroundStyle}
        >
            <header className="w-full max-w-5xl mx-auto py-6">
                {logo.url && (
                    <img src={logo.url} alt="Logo" className={`${logo.size || 'h-12'} w-auto mx-auto`} />
                )}
            </header>

            <section className="w-full max-w-5xl mx-auto text-center my-8 md:my-12">
                {headline.text && (
                    <h1 
                        className={`
                            ${headline.font_size || 'text-4xl'} 
                            ${headline.alignment || 'text-center'} 
                            leading-tight text-shadow
                        `}
                        style={headlineStyle}
                    >
                        {headline.text}
                    </h1>
                )}
                {subheadline.text && (
                    <p 
                        className={`
                            ${subheadline.font_size || 'text-lg'} 
                            ${subheadline.alignment || 'text-center'} 
                            mt-4 max-w-3xl mx-auto
                        `}
                        style={subheadlineStyle}
                    >
                        {subheadline.text}
                    </p>
                )}
            </section>

            <div className="w-full max-w-4xl mx-auto mb-12">
                <ModelRegistrationForm formStyle={form_style} />
            </div>

            <footer className="w-full text-center py-6">
                 <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Banco de Modelos. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
};

export default ModelRegistrationLandingPage;
