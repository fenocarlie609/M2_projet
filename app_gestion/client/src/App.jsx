import { RouterProvider } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import frFR from 'antd/locale/fr_FR'
import { router } from './router'

export default function App() {
  return (
    <ConfigProvider
      locale={frFR}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#0F6E56',   // vert maritime (teal)
          colorLink: '#0F6E56',
          borderRadius: 8,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        components: {
          Layout: {
            siderBg: '#001F3F',
            triggerBg: '#002a52',
          },
          Menu: {
            darkItemBg: '#001F3F',
            darkSubMenuItemBg: '#001429',
            darkItemSelectedBg: '#0F6E56',
          },
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}
