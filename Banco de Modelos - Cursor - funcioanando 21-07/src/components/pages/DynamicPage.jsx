import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DynamicPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) {
        setError("Slug da página não fornecido.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from('pages')
          .select('title, content, is_published')
          .eq('slug', slug)
          .single();

        if (dbError) throw dbError;
        
        if (data && data.is_published) {
          setPageData(data);
        } else if (data && !data.is_published) {
            setError("Esta página não está publicada no momento.");
        }
        else {
          setError("Página não encontrada.");
        }
      } catch (err) {
        console.error("Erro ao buscar página dinâmica:", err);
        setError(err.message || "Ocorreu um erro ao carregar a página.");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  const renderContent = (contentNode) => {
    if (!contentNode || !contentNode.type) return null;

    switch (contentNode.type) {
      case 'doc':
        return contentNode.content?.map((child, index) => <React.Fragment key={index}>{renderContent(child)}</React.Fragment>) || null;
      case 'paragraph':
        return <p className="mb-4 leading-relaxed">{contentNode.content?.map((child, index) => <React.Fragment key={index}>{renderContent(child)}</React.Fragment>) || ''}</p>;
      case 'heading':
        const Tag = `h${contentNode.attrs?.level || 1}`;
        return <Tag className={`font-bold mb-3 mt-5 ${contentNode.attrs?.level === 1 ? 'text-3xl' : contentNode.attrs?.level === 2 ? 'text-2xl' : 'text-xl'}`}>{contentNode.content?.map((child, index) => <React.Fragment key={index}>{renderContent(child)}</React.Fragment>) || ''}</Tag>;
      case 'text':
        let textElement = <>{contentNode.text}</>;
        if (contentNode.marks) {
          contentNode.marks.forEach(mark => {
            if (mark.type === 'bold') textElement = <strong>{textElement}</strong>;
            if (mark.type === 'italic') textElement = <em>{textElement}</em>;
            if (mark.type === 'link') textElement = <a href={mark.attrs.href} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">{textElement}</a>;
          });
        }
        return textElement;
      case 'bulletList':
        return <ul className="list-disc pl-6 mb-4 space-y-1">{contentNode.content?.map((child, index) => <React.Fragment key={index}>{renderContent(child)}</React.Fragment>) || null}</ul>;
      case 'orderedList':
        return <ol className="list-decimal pl-6 mb-4 space-y-1">{contentNode.content?.map((child, index) => <React.Fragment key={index}>{renderContent(child)}</React.Fragment>) || null}</ol>;
      case 'listItem':
        return <li>{contentNode.content?.map((child, index) => <React.Fragment key={index}>{renderContent(child)}</React.Fragment>) || ''}</li>;
      case 'image':
        return <img-replace src={contentNode.attrs.src} alt={contentNode.attrs.alt || 'Imagem da página'} className="my-4 rounded-md shadow-md max-w-full h-auto" />;
      case 'horizontalRule':
        return <hr className="my-6" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-pink-600" />
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="container mx-auto px-4 py-16 text-center min-h-[calc(100vh-12rem)]">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Erro ao Carregar Página</h1>
        <p className="text-gray-600 mb-6">{error || "Não foi possível carregar o conteúdo desta página."}</p>
        <Button onClick={() => navigate('/')} variant="outline">Voltar para o Início</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <article className="prose lg:prose-xl max-w-4xl mx-auto bg-white p-6 sm:p-8 md:p-12 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center gradient-text">{pageData.title}</h1>
        {renderContent(pageData.content)}
      </article>
    </div>
  );
};

export default DynamicPage;