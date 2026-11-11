import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import idID from 'antd/locale/id_ID';
import { App } from './App';
import i18n, { currentLocale } from './i18n';
import './styles.css';

function Root() {
  const [locale, setLocale] = useState(currentLocale());

  useEffect(() => {
    const update = () => setLocale(currentLocale());
    i18n.on('languageChanged', update);
    return () => i18n.off('languageChanged', update);
  }, []);

  return (
    <ConfigProvider
      locale={locale === 'en' ? enUS : idID}
      theme={{
        token: {
          colorPrimary: '#184E3F',
          colorInfo: '#184E3F',
          colorLink: '#184E3F',
          colorSuccess: '#2E9E66',
          colorWarning: '#C48B46',
          colorError: '#C33A35',
          colorText: '#16231E',
          colorTextSecondary: '#637069',
          colorBorder: '#E8E2D8',
          colorBgLayout: '#FBF9F5',
          colorBgContainer: '#FFFFFF',
          borderRadius: 14,
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        },
        components: {
          Menu: {
            itemBorderRadius: 10,
            itemSelectedBg: 'rgba(24, 78, 63, 0.08)',
            itemSelectedColor: '#184E3F',
            itemColor: '#4A5752',
            itemHoverBg: 'rgba(24, 78, 63, 0.04)',
            itemHoverColor: '#184E3F',
          },
          Table: {
            headerBg: '#184E3F',
            headerColor: '#FFFFFF',
            headerSortActiveBg: '#11382D',
            rowHoverBg: 'rgba(24, 78, 63, 0.03)',
            borderColor: '#E8E2D8',
          },
          Button: {
            colorPrimary: '#184E3F',
            colorPrimaryHover: '#11382D',
            colorPrimaryActive: '#0D2B23',
            controlHeight: 40,
            borderRadius: 10,
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
