import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { App as AntdApp, ConfigProvider } from 'antd';
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
          colorInfo: '#23534F',
          colorLink: '#184E3F',
          colorSuccess: '#1E563B',
          colorWarning: '#7A4F10',
          colorError: '#8F2420',
          colorText: '#1B1E1C',
          colorTextSecondary: '#5E584E',
          colorBorder: '#E8E2D8',
          colorBgLayout: '#FBF9F5',
          colorBgContainer: '#FFFFFF',
          controlItemBgActive: '#EEF4F1',
          controlItemBgHover: '#F4EFE6',
          borderRadius: 14,
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        },
        components: {
          Menu: {
            itemBorderRadius: 10,
            itemSelectedBg: '#184E3F',
            itemSelectedColor: '#FFFFFF',
            itemColor: '#433E37',
            itemHoverBg: '#EEF4F1',
            itemHoverColor: '#184E3F',
          },
          Table: {
            headerBg: '#F4EFE6',
            headerColor: '#433E37',
            headerSortActiveBg: '#E8E2D8',
            rowHoverBg: '#FBF9F5',
            borderColor: '#E8E2D8',
          },
          Button: {
            colorPrimary: '#184E3F',
            colorPrimaryHover: '#122820',
            colorPrimaryActive: '#122820',
            controlHeight: 40,
            borderRadius: 10,
          },
          Alert: {
            colorInfoBg: '#ECF3F2',
            colorInfoBorder: '#C3D8D5',
            colorSuccessBg: '#EDF5F0',
            colorSuccessBorder: '#C6DFCE',
            colorWarningBg: '#FBF4E4',
            colorWarningBorder: '#E8D3A2',
            colorErrorBg: '#FCEEEF',
            colorErrorBorder: '#EEC6C9',
          },
          Tabs: {
            inkBarColor: '#184E3F',
            itemSelectedColor: '#184E3F',
            itemHoverColor: '#184E3F',
          },
          Select: {
            optionSelectedBg: '#EEF4F1',
            optionActiveBg: '#F4EFE6',
          },
        },
      }}
    >
      <AntdApp>
        <App />
      </AntdApp>
    </ConfigProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
