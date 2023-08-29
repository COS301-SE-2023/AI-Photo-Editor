<script lang="ts">
  const ws = new WebSocket("ws://localhost:60606");

  ws.onopen = () => {
    console.log("connected");
    ws.send("hello");
  };

  ws.onmessage = (evt) => {
    console.log(evt.data);
  };
</script>

<h1>hello</h1>

<style>
</style>
