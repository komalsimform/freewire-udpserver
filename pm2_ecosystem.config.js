module.exports = {
    'apps': [{
        'name': 'freewire-udpserver',
        'script': 'app.js',
        'env': {
            'PORT': '8084',
            'NODE_ENV': 'development'
        },
        'env_production': {
            'NODE_ENV': 'production'
        }
    }]
}; 
