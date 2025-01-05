self.addEventListener('push', function(event) {
    const options = {
        body: event.data ? event.data.text() : 'New update!',
        icon: '/assets/santa.png',
        badge: '/assets/santa.png'
    };

    event.waitUntil(
        self.registration.showNotification('Push Notification', options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('https://master-trackers.xyz') // Redirect the user when they click the notification
    );
});
