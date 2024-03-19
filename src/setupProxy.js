const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app){
  app.use(
    createProxyMiddleware('/auth',{
      target:"https://spirokitdev.the-researcher.com/v1",
      changeOrigin: true,
    })
  )
  app.use(
    createProxyMiddleware('/countries',{
      target:'https://spirokitdev.the-researcher.com/v1',
      changeOrigin: true,        
    })
  )
  app.use(
    createProxyMiddleware('/clinics',{
      target:'https://spirokitdev.the-researcher.com/v1',
      changeOrigin: true,        
    })
  )
  app.use(
    createProxyMiddleware('/subjects',{
      target:'https://spirokitdev.the-researcher.com/v1',
      changeOrigin: true,        
    })
  )
  // app.use(
  //   createProxyMiddleware('/subjects',{
  //     target:'https://spirokitdev.the-researcher.com/v3',
  //     changeOrigin: true,        
  //   })
  // )

  app.use(
    createProxyMiddleware('/v3/subjects',{
      target:'https://spirokitdev.the-researcher.com/',
      changeOrigin: true,        
    })
  )
  app.use(
    createProxyMiddleware('/clinicians',{
      target:'https://spirokitdev.the-researcher.com/v1',
      changeOrigin: true,
    })
  )
  app.use(
    createProxyMiddleware('/devices',{
      target:'https://spirokitdev.the-researcher.com/v1',
      changeOrigin: true,
    })
  )
  
  app.use(
    createProxyMiddleware('/calibrations',{
      target:'https://spirokitdev.the-researcher.com/v1',
      changeOrigin: true,
    })
  )
  
  app.use(
    createProxyMiddleware('/measurements',{
      target:'https://spirokitdev.the-researcher.com/v1',
      changeOrigin: true,
    })
  )

  
};


