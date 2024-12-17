module.exports = {
    networkConfig :{
        labels: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
        config:{
            'a': {
                peers: ['b', 'c']
            },
            'b': {
                peers: ['d', 'e', 'g']
            },
            'c': {
                peers: ['d', 'f', 'g']
            }
        }
    }
}