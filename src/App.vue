<template>
    <v-app>
        <v-content>
            <navbar></navbar>
            <router-view id="router_view"/>
        </v-content>
        <notifications></notifications>
    </v-app>
</template>
<script>
    import Notifications from '@/components/Notifications';
    import Navbar from './components/Navbar';

    export default {
        components: {
            Navbar,
            Notifications
        },
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
      background-color: #eaeaea;
    }

    #nav {
        height: 80px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        z-index: 2;
        background-color: #fff;

        a {
            margin: 20px;
            font-weight: bold;
            color: #444;

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
        position: relative;
    }

    @media only screen and (max-width: 600px) {
        #nav{
            position: fixed;
            height: 80px;
            width: 100%;
            top: 0px;
            z-index: 2;

            a{
                font-size: 12px;
            }
        }

        #router_view{
            padding-top: 80px;
        }
    }
</style>
