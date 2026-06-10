import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/settings', // Скрываем личные настройки пользователей от краулеров поисковиков
    },
  }
}
