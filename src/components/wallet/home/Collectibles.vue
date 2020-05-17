<template>
    <div>
        <div class="coming_soon">
            <p>NFTs Coming Soon</p>
        </div>
<!--        <div class="list">-->
<!--            <div class="item" v-for="(card, i) in cards" :key="i">-->
<!--                <img :src="card.url">-->
<!--                <p class="collectible_title">{{card.title}}</p>-->
<!--                <p class="series">{{card.series}}</p>-->

<!--                <div class="options">-->
<!--                    <button>Send</button>-->
<!--                    <button>Swap</button>-->
<!--                </div>-->
<!--            </div>-->

<!--            <div class="item missing_item" v-for="i in 2" :key="i">-->
<!--                <img src="https://usercontent1.hubstatic.com/14892354_f520.jpg">-->
<!--                <p class="collectible_title">Zulgadon of High Castle</p>-->
<!--                <p class="series">Pokemon Vol. I</p>-->

<!--                <div class="options">-->
<!--                    <button>Buy</button>-->
<!--                    <button>About</button>-->
<!--                </div>-->
<!--            </div>-->
<!--        </div>-->
    </div>
</template>
<script>
    export default {
        data(){
            return {
                cards: [
                    // {
                    //     title: "High Priestess of Prophecy",
                    //     series: "Pokemon Vol. I",
                    //     url: "https://usercontent1.hubstatic.com/14892354_f520.jpg",
                    // },
                    // {
                    //     title: "High Priestess of Prophecy",
                    //     series: "Pokemon Vol. I",
                    //     url: "https://usercontent1.hubstatic.com/13739072_f1024.jpg",
                    // }
                ]
            }
        }
    }
</script>
<style lang="scss" scoped>

    $flip_dur: 0.6s;


    .coming_soon{

        p {
            font-size: 28px;
        }
    }

    .list{
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
        grid-row-gap: 15px;
        grid-column-gap: 15px;
    }
    .item{
        height: 220px;
        /*background-color: #303030;*/
        /*border-radius: 4px;*/
        position: relative;

        img{
            width: 100%;
            max-height: 220px;
            object-fit: contain;
            border-radius: 4px;
            transition-duration: $flip_dur;
        }


        .collectible_title, .series{
            text-align: center;
            font-size: 12px;
        }
        .collectible_title{
            font-size: 14px;
        }
    }

    .options{
        background-color: #ddd;
        padding-top: 30px;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-self: center;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
        opacity: 0;
        transition-duration: $flip_dur;
        transform: rotateY(180deg);

        button{
            margin-bottom: 10px;
            background-color: #000;
            color: #fff;
            width: 80px;
            border-radius: 12px;
            padding: 6px 14px;
        }
    }


    .item:hover{
        img{
            transform: rotateY(180deg);
            opacity: 0;
        }

        .options{
            opacity: 1;
            transform: rotateY(0deg);
        }
    }


    .missing_item{
        opacity: 0.4;
        filter: grayscale(100%);
    }



</style>
