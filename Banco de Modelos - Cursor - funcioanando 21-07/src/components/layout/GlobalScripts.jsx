import React, { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const GlobalScripts = () => {
  useEffect(() => {
    // Carrega Google Fonts
    const loadGoogleFonts = () => {
      if (typeof window !== 'undefined' && !document.querySelector('#google-fonts-link')) {
        const link = document.createElement('link');
        link.id = 'google-fonts-link';
        link.rel = 'preconnect';
        link.href = 'https://fonts.googleapis.com';
        document.head.appendChild(link);

        const link2 = document.createElement('link');
        link2.rel = 'preconnect';
        link2.href = 'https://fonts.gstatic.com';
        link2.crossOrigin = 'anonymous';
        document.head.appendChild(link2);

        const fontLink = document.createElement('link');
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
      }
    };

    // Carrega pixels de rastreamento diretamente do Supabase
    const loadTrackingPixels = async () => {
      try {
        // Busca configurações diretamente do Supabase sem usar hooks
        const { data: settingsData, error } = await supabase
          .from('app_settings')
          .select('key, value')
          .in('key', ['FACEBOOK_PIXEL_ID', 'GOOGLE_TRACKING_ID', 'HEAD_CUSTOM_SCRIPTS']);

        if (error) {
          console.log('Erro ao carregar configurações para scripts:', error.message);
          return;
        }

        // Converte para objeto mais fácil de usar
        const appSettings = settingsData.reduce((acc, setting) => {
          acc[setting.key] = setting.value?.value;
          return acc;
        }, {});

        console.log('Configurações carregadas para scripts:', Object.keys(appSettings));

        // Facebook Pixel
        if (appSettings.FACEBOOK_PIXEL_ID && !document.querySelector('#fb-pixel-script')) {
          const fbPixelScript = document.createElement('script');
          fbPixelScript.id = 'fb-pixel-script';
          fbPixelScript.innerHTML = `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${appSettings.FACEBOOK_PIXEL_ID}');
            fbq('track', 'PageView');
          `;
          document.head.appendChild(fbPixelScript);
          console.log('Facebook Pixel carregado');
        }

        // Google Analytics
        if (appSettings.GOOGLE_TRACKING_ID && !document.querySelector('#ga-script')) {
          const gtag = document.createElement('script');
          gtag.id = 'ga-script';
          gtag.async = true;
          gtag.src = `https://www.googletagmanager.com/gtag/js?id=${appSettings.GOOGLE_TRACKING_ID}`;
          document.head.appendChild(gtag);

          const gtagScript = document.createElement('script');
          gtagScript.id = 'ga-config-script';
          gtagScript.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${appSettings.GOOGLE_TRACKING_ID}');
          `;
          document.head.appendChild(gtagScript);
          console.log('Google Analytics carregado');
        }

        // Scripts personalizados
        if (appSettings.HEAD_CUSTOM_SCRIPTS && !document.querySelector('#custom-scripts')) {
          const customScript = document.createElement('script');
          customScript.id = 'custom-scripts';
          customScript.innerHTML = appSettings.HEAD_CUSTOM_SCRIPTS;
          document.head.appendChild(customScript);
          console.log('Scripts personalizados carregados');
        }
      } catch (error) {
        console.log('Erro ao carregar scripts de rastreamento:', error.message);
        // Não quebra a aplicação, apenas loga o erro
      }
    };

    loadGoogleFonts();
    loadTrackingPixels();
  }, []);

  return null;
};

export default GlobalScripts;