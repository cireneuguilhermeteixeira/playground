self.addEventListener('install', function(e) {
  // This event will be fired once when this version of the script is first registered for
  // a given URL scope.
  // It's an opportunity to initialize caches and prefetch data, if desired.
  console.log('Install event:', e);
});

self.addEventListener('activate', function(e) {
  // This event will be fired once when this version of the script is first registered for
  // a given URL scope.
  // It's an opportunity to clean up any stale data that might be left behind in self.caches
  // by an older version of this script.
  console.log('Activate event:', e);
});