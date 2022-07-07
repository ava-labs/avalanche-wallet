<template>
    <li>
        <input type="checkbox" />
        <div>
            <p class="add_title">Address {{ index }}</p>
            <p class="add_val">{{ value }}</p>
        </div>
    </li>
</template>
<script>
export default {
    props: {
        index: Number,
        value: {
            required: true,
            type: String,
        },
    },
}
</script>
<style scoped>
li p {
    margin: 0;
    padding-left: 10px;
}

.add_title {
    font-size: 12px;
    font-weight: bold;
}
.add_val {
    font-size: 14px;
}
</style>
