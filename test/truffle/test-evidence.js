const Evidence = artifacts.require('../../contracts/Evidence.sol')

// utils
let cleanSolidityString = (str) => str.replace(/\0[\s\S]*$/g,'')


contract('Evidence', function([creator, receiver]) {
  // creator and receiver are address strings we can use!

  let evid

  // const vars for testing
  //uint[] _clear_images, uint[] _blurred_images, int _lat, int _long, uint _price, string _desc, address _receiver, uint _violation_type
  var clear_images = ["buzz", "woody", "marlin", "nemo"];
  var blurred_images = ["zzub", "ydoow", "nilram", "omen"];
  var lat = 42000000;
  var lon = -73000000;
  var price = 1e+18; // 1 ether, in wei
  var desc = "hello";
  var violation_type = 1;

  before('set up a contract to use in all tests', async () => {
    evid = await Evidence.new(clear_images, blurred_images, lat, lon, price, desc, creator, receiver, violation_type)
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

  it('calls getter functions correctly', async() => {
    // get blurred images
    let purportedBlurredImagesRaw = await evid.getBlurredImages()
    let purportedBlurredImages = purportedBlurredImagesRaw.map(
      (s) => cleanSolidityString(web3.toAscii(s)))
    assert.deepEqual(purportedBlurredImages, blurred_images)

    // get description
    let purportedDescriptionRaw = await evid.getDescription()
    // description is a string, but has extra \0's on the end
    let purportedDescription = cleanSolidityString(purportedDescriptionRaw)
    assert.equal(purportedDescription, desc)
  })

  it('previews correctly', async () => {
    // the output is a raw bytes32 list
    // need to convert to ascii's
    let previewImagesRaw = await evid.preview({ from: receiver })
    let previewImages = previewImagesRaw.map((s) => cleanSolidityString(web3.toAscii(s)))
    // console.log(previewImagesRaw)
    // console.log(previewImages)
    assert.deepEqual(previewImages, blurred_images)
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
    // TODO: see if we get some back
    let valueOffered = price * 3

    // pre-txn balance of creator
    // we can't measure how much money the receiver lost rn, because
    // that is "tainted" since they lost some $$$ from gas
    let creatorPreBalance = web3.eth.getBalance(creator).toNumber()

    let purchaseTransactionHash = await evid.purchase.sendTransaction({
      value: valueOffered,
      from: receiver
    })
    // TODO this doesn't work rn, but it could be useful in helping specify
    // how much ETH should be left in sender's account
    // // get details about the transaction to figure out how much ETH would be spent
    // let transactionDetails = web3.eth.getTransaction(purchaseTransactionHash)
    // let gasSpent = transactionDetails.gas
    // let gasPrice = transactionDetails.gasPrice.toNumber()
    // console.log(gasPrice + "*" + gasPrice)

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
    assert.deepEqual(previewImages, clear_images)
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
