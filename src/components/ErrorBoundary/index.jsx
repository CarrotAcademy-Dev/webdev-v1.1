import { Component } from 'react';
import { logger } from '@/utils/logger';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to tracking service
    logger.error('React Error Boundary caught error', error, 'ErrorBoundary');
    logger.debug('Error details', errorInfo, 'ErrorBoundary');

    // Store error info in state
    this.setState({ errorInfo });

    // TODO: Send to error tracking service (Sentry, LogRocket)
    // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '40px',
            maxWidth: '600px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            textAlign: 'center'
          }}>
            {/* Error Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 20px',
              background: '#fee',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px'
            }}>
              ⚠️
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1a202c',
              marginBottom: '12px'
            }}>
              Oops! Terjadi Kesalahan
            </h1>

            {/* Description */}
            <p style={{
              color: '#718096',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              Maaf, aplikasi mengalami kendala teknis. Tim kami telah menerima laporan error ini dan akan segera memperbaikinya.
            </p>

            {/* Error Message (only in development) */}
            {import.meta.env.DEV && this.state.error && (
              <details style={{
                background: '#f7fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'left'
              }}>
                <summary style={{
                  cursor: 'pointer',
                  fontWeight: '500',
                  color: '#2d3748',
                  marginBottom: '12px'
                }}>
                  Detail Error (Development Mode)
                </summary>
                <pre style={{
                  fontSize: '12px',
                  color: '#c53030',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && '\n\n' + this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '12px 24px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#5568d3'}
                onMouseOut={(e) => e.target.style.background = '#667eea'}
              >
                🔄 Muat Ulang Halaman
              </button>

              <button
                onClick={this.handleGoHome}
                style={{
                  padding: '12px 24px',
                  background: 'white',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.borderColor = '#5568d3'}
                onMouseOut={(e) => e.target.style.borderColor = '#667eea'}
              >
                🏠 Kembali ke Beranda
              </button>
            </div>

            {/* Help Text */}
            <p style={{
              color: '#a0aec0',
              fontSize: '12px',
              marginTop: '24px'
            }}>
              Jika masalah berlanjut, hubungi tim IT atau coba logout dan login kembali.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
