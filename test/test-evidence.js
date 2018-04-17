const Evidence = artifacts.require('../contracts/Evidence.sol')

// utils
let cleanSolidityString = (str) => str.replace(/\0[\s\S]*$/g,'')


contract('Evidence', function([creator, receiver]) {
  // creator and receiver are address strings we can use!

  let evid

  // const vars for testing
  //uint[] _clearImages, uint[] _blurredImages, int _lat, int _long, uint _price, string _desc, address _receiver, uint _violation_type
  var clearImages = ["buzz", "woody", "marlin", "nemo"];
  var blurredImages = ["zzub", "ydoow", "nilram", "omen"];
  var lat = 42000000;
  var lon = -73000000;
  var price = 1e+18; // 1 ether, in wei
  var desc = "hello";
  var violation_type = 1;

  before('set up a contract to use in all tests', async () => {
    evid = await Evidence.new(clearImages, blurredImages, lat, lon, price, desc, creator, receiver, violation_type)
    console.log(await evid.address)
  })

  it('passes a trivial test', async () => {
    assert.equal(3, 3)
  })

  it('correctly stored basic variables', async () => {
    assert.equal(await evid.violation_type(), violation_type)
    assert.equal(await evid.creator(), creator)
    assert.equal(await evid.price(), price)
  })

  it('previews correctly', async () => {
    // the output is a raw bytes32 list
    // need to convert to ascii's
    let previewImagesRaw = await evid.preview({ from: receiver })
    let previewImages = previewImagesRaw.map((s) => cleanSolidityString(web3.toAscii(s)))
    // console.log(previewImagesRaw)
    // console.log(previewImages)
    assert.deepEqual(previewImages, blurredImages)
  })

  it('should NOT purchase with insufficient funds', async () => {
    // try sending LESS money than needed
    let valueOffered = price / 10

    // pre-txn balance of creator
    let creatorPreBalance = web3.eth.getBalance(creator).toNumber()

    let purchaseTransaction = await evid.purchase.sendTransaction({
      value: valueOffered,
      from: receiver
    })

    // ensure the receiver has earned no money
    let creatorPostBalance = web3.eth.getBalance(creator).toNumber()
    assert.equal(creatorPostBalance, creatorPreBalance)

    // should not say bought
    assert.equal(await evid.bought(), false)
  })


  it('should purchase with sufficient funds', async () => {
    // try sending EXTRA money
    // TODO: and see if we get some back
    let valueOffered = price * 3

    // pre-txn balance of creator
    let creatorPreBalance = web3.eth.getBalance(creator).toNumber()

    let purchaseTransaction = await evid.purchase.sendTransaction({
      value: valueOffered,
      from: receiver
    })

    // ensure the creator earned exactly as much $ as the receiver sent it
    let creatorPostBalance = web3.eth.getBalance(creator).toNumber()
    assert.equal(creatorPostBalance - creatorPreBalance, price)

    // should say it was bought
    assert.equal(await evid.bought(), true)
  })

  it('previews correctly after purchase', async () => {
    // similar to before, except we should have gotten the CLEAR images
    // not the BLURRED ones since we bought it

    // the output is a raw bytes32 list
    // need to convert to ascii's
    let previewImagesRaw = await evid.preview({ from: receiver })
    let previewImages = previewImagesRaw.map((s) => cleanSolidityString(web3.toAscii(s)))
    // console.log(previewImagesRaw)
    // console.log(previewImages)
    assert.deepEqual(previewImages, clearImages)
  })

  // it('has an owner', async function() {
  //   assert.equal(await fundRaise.owner(), owner)
  // })
  //
  // it('is able to accept funds', async function() {
  //   await fundRaise.sendTransaction({
  //     value: 1e+18,
  //     from: donor
  //   })
  //
  //   const fundRaiseAddress = await fundRaise.address
  //   assert.equal(web3.eth.getBalance(fundRaiseAddress).toNumber(), 1e+18)
  // })
})
