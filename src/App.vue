<template>
    <v-app>
      <v-content>
        <router-view id="router_view"/>
      </v-content>
    </v-app>
</template>
<script>
  // import Navbar from './components/Navbar';
  export default {
    components: {
      // Navbar
    }
  }
</script>

<style lang="scss">

  html{
    height: 100%;
  }
  body{
    height: 100%;
  }
#app {
  min-height: 100%;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #f2f2f2;
}

#nav {
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  /*padding: 30px;*/
  background-color: #fff;
  /*height: 60px;*/

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

  #router_view{
    min-height: calc(100vh - 80px);
  }
</style>
