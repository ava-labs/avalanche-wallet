<template>
    <img src="@/assets/spinner-solid.svg">
</template>
<style scoped lang="scss">
    img{
        width: 20px;
        object-fit: contain;
        animation-name: spin;
        animation-duration: 1s;
        animation-iteration-count: infinite;
    }
    @keyframes spin {
        from {transform: rotateZ(0deg);}
        to {transform: rotateZ(360deg);}
    }
</style>
