module.exports = {
  // Base preset for Vue CLI projects, handling JSX, polyfills, and ES6+ features
  presets: [
    ['@vue/cli-plugin-babel/preset', {
      useBuiltIns: 'usage', // Optimization: Only imports necessary polyfills
      corejs: 3             // Uses latest Core-JS for better compatibility
    }]
  ],
  
  // Experimental/Modern JavaScript Feature Support
  plugins: [
    /**
     * @babel/plugin-proposal-decorators
     * legacy: true -> Required for Vue Property Decorators and MobX.
     * It allows the use of @Component or @Prop syntax.
     */
    ['@babel/plugin-proposal-decorators', { legacy: true }],

    /**
     * @babel/plugin-proposal-class-properties
     * loose: true -> Essential when legacy decorators are enabled.
     * Prevents "Set" vs "Define" conflicts in class fields.
     */
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    
    // Recommended: Handles private methods in classes efficiently
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    ['@babel/plugin-proposal-private-property-in-object', { loose: true }]
  ],
}
