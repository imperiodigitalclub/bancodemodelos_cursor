import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("Uncaught error:", error, errorInfo);
    // Aqui você poderia enviar o erro para um serviço de logging (ex: Sentry, LogRocket)
    // Ex: logErrorToMyService(error, errorInfo);
  }

  handleResetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Tenta recarregar a página ou redirecionar para a home
    // window.location.reload(); // Opção 1: Recarregar
    window.location.href = '/'; // Opção 2: Ir para a home
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl max-w-lg w-full transform transition-all hover:scale-105 duration-300">
            <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6 animate-pulse" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">Ops! Algo deu um tropeção...</h1>
            <p className="text-gray-600 mb-3 text-sm sm:text-base">
              Nossa equipe já foi notificada e estamos trabalhando para consertar o mais rápido possível. 
            </p>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Como estamos em fase Beta 🚧, algumas coisinhas ainda estão sendo ajustadas. Agradecemos sua compreensão e paciência!
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left bg-red-50 p-3 rounded-md border border-red-200">
                <summary className="text-red-700 font-medium cursor-pointer">Detalhes do Erro (Dev)</summary>
                <pre className="mt-2 text-xs text-red-600 whitespace-pre-wrap break-all">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack && (
                    `\n\nStack do Componente:\n${this.state.errorInfo.componentStack}`
                  )}
                </pre>
              </details>
            )}

            <Button 
              onClick={this.handleResetError}
              className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 text-base"
            >
              <RefreshCw className="mr-2 h-5 w-5" /> Tentar Novamente
            </Button>
            <p className="mt-8 text-xs text-gray-500">
              Se o problema persistir, por favor, entre em contato com o suporte.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;