import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error Boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#1a1a1a] rounded-lg p-8">
                    <div className="text-center">
                        <h2 className="text-[#fdb377] text-xl font-bold mb-4">
                            Bir hata oluştu
                        </h2>
                        <p className="text-[#e2e8f0] mb-4">
                            Analiz sayfası yüklenirken beklenmeyen bir hata oluştu.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-[#fdb377] text-[#1a1a1a] px-4 py-2 rounded-lg hover:bg-[#c0976a] transition-colors"
                        >
                            Sayfayı Yenile
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 