<template>
    <div class="tabs">
        <router-link to="/wallet/send">
                                <span>
                                    <fa class="icon" icon="exchange-alt"></fa>
                                </span>
            {{$t('tabs.send')}}
        </router-link>
        <router-link to="/wallet/keys">
                                <span>
                                    <fa class="icon" icon="key"></fa>
                                </span>
            {{$t('tabs.keys')}}
        </router-link>
        <router-link to="/wallet/advanced">
                                <span>
                                    <fa class="icon" icon="dna"></fa>
                                </span>
            {{$t('tabs.advanced')}}
        </router-link>
    </div>
</template>
<style lang="scss" scoped>
    .tabs{
        background-color: #fafafa;
        border-radius: 0px;
    }
    .tabs a{
        /*display: block;*/
        display: inline-block;
        border: none;
        background-color: transparent;
        padding: 10px 18px;
        text-decoration: none;
        text-align: left;
        font-weight: bold;
        color: #aaa;
        font-size: 15px;
        border-right: 1px solid #eaeaea;


        /*border-bottom: 1px solid #39403d;*/


        &.router-link-active {
            color: #42b983;
            background-color: #fff;
            /*border: none*/
            /*border-right: 4px solid #42b983;*/
        }
    }


    @media only screen and (max-width: 600px) {
        .tabs {
            display: flex;
        }
        .tabs a{
            flex-grow: 1;
        }
    }
</style>