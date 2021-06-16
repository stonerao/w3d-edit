<template>
    <div class="point-edit">
        <div class="point-edit-list">
            <t-scroll>
                <template v-slot:main>
                    <div>
                        <div @click="activePoint(item)" class="point-list-item" v-for="item in data" :key="item.id">{{item.name}}</div>
                    </div>
                </template>
            </t-scroll>
        </div>
        <div class="point-edit-oper">
            <a-button class="point-btns" type="primary" size="small" @click="getPoint">取点({{state?'开':'关'}})</a-button>
            <a-button class="point-btns" type="primary" size="small" @click="setShow">显示全部</a-button>
            <a-button class="point-btns" size="small" @click="setHiden">取消显示</a-button> 
        </div>
    </div>
</template>
<script>
export default {
    props: {
        data: Array
    },
    data() {
        return {
            state: false, 
        }
    },
    mounted() {},
    methods: {
        getPoint() {
            this.state = !this.state;
            this.$emit("getPoint", this.state);
        },
        overEnd() {
            this.state = false;
            this.$emit("getPoint", this.state);
        },
        updateList(data) {
            // this.data = data; 
        },
        setShow() {
           this.$emit("setOption", "visible", true);     
        },
        setHiden() {
            this.$emit("setOption", "visible", false);     
        },
        activePoint(item) { 
            this.$emit("activePoint", item.position)
        }
    },
    components: {},
};
</script>

<style scoped lang="less">
.point-edit {
    position: absolute;
    top: 42px;
    height: 400px;
    width: 300px;
    background: #fff;
    right: 300px;
    z-index: 5;
    box-shadow: 0px 2px 7px #333;
}
.point-edit-list {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 30px;
}
.point-edit-oper {
    position: absolute;
    height: 30px;
    right: 0;
    left: 0;
    bottom: 0px;
    .point-btns{
        margin:0 10px
    }
}
.point-list-item{
    line-height:20px;
    padding: 0 5px;
    transition:all .2s;
    cursor: pointer;
    &:hover{
        color:#ff0000;
    }
}
</style>
