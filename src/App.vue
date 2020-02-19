<template>
    <v-app>
      <v-content>
          <navbar></navbar>
          <router-view id="router_view"/>
      </v-content>
    </v-app>
</template>
<script>
  import Navbar from './components/Navbar';
  export default {
    components: {
      Navbar
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
      text-align: left;
      color: #2c3e50;
      background-color: #292929;
    }

    #nav {
        height: 80px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        z-index: 2;
        background-color: #232323;

        a {
            margin: 20px;
            font-weight: bold;
            color: #d2d2d2;

            &.router-link-exact-active {
                color: #42b983;
            }
        }
    }

    button{
        outline: none;
    }

      #router_view{
        min-height: calc(100vh - 80px);
      }

      @media only screen and (max-width: 600px) {
          #nav{
              position: fixed;
              height: 40px;
              width: 100%;
              top: 0px;
              z-index: 2;

              a{
                  font-size: 12px;
              }
          }

          #router_view{
              padding-top: 40px;
          }
      }
</style>
