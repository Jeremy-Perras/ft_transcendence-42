<template>
  <div>
      <canvas ref="game" 
        width="640" 
        height="480" 
        style="border: 1px solid black;">
      </canvas>
  </div>
</template>

<script>
  import io from "socket.io-client";
  export default {
    name: 'BlockGame',
   data(){
    return{
      socket :{},
      context: {},
      position:{
        x:0,
        y:0
        }
      }
    },
    create(){
      this.socket=io("http://127.0.0.1:3000");
    },
    mounted(){
      this.context = this.$refs.game.getContext("2d");
      this.socket.on("position",data=>{
        this.position = data;
        this.context.fillRect(this.position.x,this.position.y,20,20);
      });
      // this.socket.on("position",data=>{
      //   this.position = data;
      //   this.context.fillRect(this.position.x,this.position.y,20,20);
      // });
     
    }

   
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
