import { Server } from "@hocuspocus/server";

const server = new Server({
    port: 1234,
    async onConnect(data) {
        console.log(`Connected to ${data.documentName}`);
    },
});

server.listen().then(() => {
    console.log("Hocuspocus Server listening on port 1234");
});
