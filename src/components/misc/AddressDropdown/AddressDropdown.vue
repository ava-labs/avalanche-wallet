<template>
    <div class="address_dropdown">
        <div class="display" @click="toggle">
            <p class="placeholder" v-if="value.length===0">Select Address</p>
            <div v-else class="display_val">
                <p class="chip">{{value[0]}}</p>
                <p v-if="value.length>1"> and {{ value.length-1 }} others.</p>
            </div>
            <p class="caret"><fa icon="caret-down"></fa></p>
        </div>
        <div ref="popup_list" class="list" v-show="active" @focus="focus" @blur="blur" tabindex="1">
<!--            <v-select></v-select>-->
            <ul>
                <li class="select_all" @click="toggleAll" v-if="multiple">
                    <input type="checkbox" :checked="isAll">
                    <p class="add_title">All Addresses</p>
                </li>
<!--                <list-item v-for="(item, index) in items" :key="item" :value="item" :index="index"></list-item>-->
                <li v-for="(item, index) in items" :key="item" @click="toggleItem(item, index)">
                    <input type="checkbox" :checked="value.includes(item)">
                    <div>
                        <p class="add_title">Address {{index}}</p>
                        <p class="add_val">{{item}}</p>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
    // import ListItem from './ListItem';
    export default {
        components:{
            // ListItem
        },
        props: {
            multiple: {
                type: Boolean,
                default: false
            },
            default_val: {
                type: Array,
            }
        },
        mounted() {
            if(this.default_val){
                console.log("LOAD DEFAULT");
                this.value = this.default_val.slice();
                this.emit();
            }
        },
        data(){
            return {
                active: false,
                isAll: false,
                value: []
            }
        },
        computed: {
            items(){
                return this.$store.state.addresses;
            }
        },
        methods: {
            blur(){
                this.active = false;
            },

            focus(){
            },

            toggle(){
                let parent = this;
                this.active = !this.active;
                this.$nextTick(()=> {
                    if(parent.active){
                        parent.$refs['popup_list'].focus();
                    }
                })
            },

            toggleItem(val){
                if(this.value.includes(val)){
                    let index = this.value.indexOf(val);
                    this.value.splice(index,1);
                }else{
                    if(this.multiple){
                        this.value.push(val);
                    }else{
                        this.value = [val];
                    }
                }

                if(this.value.length !== this.items.length){
                    this.isAll = false;
                }else{
                    this.isAll = true;
                }
                this.emit();
            },

            toggleAll(){
                if(this.isAll){
                    this.value = []
                }else{
                    this.value = this.items.slice();
                }
                this.isAll = !this.isAll;
                this.emit();
            },

            emit(){
                this.$emit('change', this.value);
            }
        }
    }
</script>
<style scoped>
    .address_dropdown{
        position: relative;
        border: 1px solid #303030;
        cursor: pointer;

    }

    .placeholder{
        flex-grow: 1;
    }
    .placeholder span{
        float: right;
        margin-right: 5px;
    }
    .display{
        padding: 4px;
        background-color: #404040;
        display: flex;
        align-items: center;
    }

    .display_val{
        flex-grow: 1;
    }
    .display .caret{
        padding-right: 8px;
        height: min-content;
    }

    .display div{
        display: flex;
        align-items: center;
    }
    .display p{
        margin: 0;
        font-size: 14px;
    }

    .display .chip{
        user-select: none;
       display: inline-block;
        font-size: 14px;
        background-color: #dcdcdc;
        color: #111;
        margin: 3px;
        padding: 2px 4px;
        border-radius: 8px;
    }

    .list{
        position: absolute;
        top: 0;
        background-color: #303030;
        width: 100%;
        z-index: 2;
        max-height: 200px;
        overflow: scroll;
        outline: none;
    }

    .list ul{
        padding: 0;
    }


    li{
        align-items: center;
        display: flex;
        list-style: none;
        padding: 4px 14px;
        border: none;
        border-bottom: 1px solid #404040;
    }

    li:hover{
        background-color: #404040;
        cursor: pointer;
    }
    li input{
        user-select: none;
    }
    li p{
        margin: 0;
        padding-left: 10px;
        user-select: none;
    }

    .add_title{
        font-size: 12px;
        font-weight: bold;
    }
    .add_val{
        font-size: 14px;
    }


    .select_all{
        padding: 14px;
        border-color: #707070;
        /*border-style: dashed;*/
    }
</style>

<style>
</style>