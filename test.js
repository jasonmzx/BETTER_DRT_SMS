const arr = [{
    "sentAt":"2012-11-13T17:29:37.003Z",
    "uuid": "435453",
    "content": "1",
    "senderUuid": "2"
  },
  {
    "sentAt":"2015-05-22T13:55:10.542Z",
    "uuid": "4354353",
    "content": "2",
    "senderUuid": "2"
  },
  {
    "sentAt":"2012-11-20T01:31:33.751Z",
    "uuid": "4354353",
    "content": "3",
    "senderUuid": "1"
  },
  {
    "sentAt":"2016-02-17T10:13:03.115Z",
    "uuid": "435453",
    "content": "4",
    "senderUuid": "2"
  },
  {
    "sentAt":"2015-05-22T13:55:10.542Z",
    "uuid": "4354353",
    "content": "2",
    "senderUuid": "1"
  }]

  arr.forEach((input,index) =>{
    if( (arr.filter((elm) => input.uuid == elm.uuid && input.content == elm.content)).length > 1 ){
      arr.splice(index,1)
    } 
  });

  console.log(arr)