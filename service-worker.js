const CACHE_NAME = 'daily-expense-tracker-v1';
const ASSETS_TO_CACHE = [
  '/daily-expense-tracker/',
  '/daily-expense-tracker/index.html',
  '/daily-expense-tracker/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.min.js',
  'https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/0eab2c2c0a9d4dd8ab76ff05deab1fcf~tplv-a9rns2rl98-image.image?rcl=20251229092651325D461E188D1E4632BD&rk3s=8e244e95&rrcfp=f06b921b&x-expires=1769563626&x-signature=aELpI9ZJmJdwFvu58AVr9%2BTmDjg%3D',
  'https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/96cf5578422542448db13fb113eb492e~tplv-a9rns2rl98-image.image?rcl=20251229092651325D461E188D1E4632BD&rk3s=8e244e95&rrcfp=f06b921b&x-expires=1769563627&x-signature=4%2BH6VbdwJfL6%2FPzOeQWcrZJ8fD0%3D',
  'https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/d393267f7b5746189a97bded4fb2e2db~tplv-a9rns2rl98-image.image?rcl=20251229092651325D461E188D1E4632BD&rk3s=8e244e95&rrcfp=f06b921b&x-expires=1769563625&x-signature=iwCs0YVib2O%2BP90MDiD9yMSuKKk%3D'
];

// 安装Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 拦截网络请求
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果在缓存中找到响应，则返回缓存的响应
        if (response) {
          return response;
        }
        
        // 否则发起网络请求
        return fetch(event.request).then(
          response => {
            // 检查响应是否有效
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 克隆响应，因为响应是流，只能使用一次
            const responseToCache = response.clone();
            
            // 将响应添加到缓存
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          }
        );
      }).catch(() => {
        // 如果网络请求失败且缓存中没有响应，则返回一个基本的离线页面
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/daily-expense-tracker/index.html');
        }
      })
  );
});

// 处理推送通知
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: 'https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/0eab2c2c0a9d4dd8ab76ff05deab1fcf~tplv-a9rns2rl98-image.image?rcl=20251229092651325D461E188D1E4632BD&rk3s=8e244e95&rrcfp=f06b921b&x-expires=1769563626&x-signature=aELpI9ZJmJdwFvu58AVr9%2BTmDjg%3D',
    badge: 'https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/0eab2c2c0a9d4dd8ab76ff05deab1fcf~tplv-a9rns2rl98-image.image?rcl=20251229092651325D461E188D1E4632BD&rk3s=8e244e95&rrcfp=f06b921b&x-expires=1769563626&x-signature=aELpI9ZJmJdwFvu58AVr9%2BTmDjg%3D',
    data: {
      url: data.url
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 处理通知点击
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/daily-expense-tracker/')
  );
});