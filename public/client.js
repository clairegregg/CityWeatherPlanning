var app = new Vue({
    el: '#app',
    data: {
        randMin: 1,
        randMax: 10,
        random: -1,
        history: []
    },
    methods: {
        GetRand: getRandom
    }
})
function getRandom() {
    console.log("getRandom called")
    let prom = fetch("random/" + this.randMin + "/" + this.randMax)
    prom.then(response => response.json())
        .then(response => {
            this.random = response.result
            this.history.push(response.result)
        })
}