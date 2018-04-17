const Evidence = artifacts.require('../contracts/Evidence.sol')

contract('Evidence', function([a1, a2]) {
  let evid

  beforeEach('setup contract for each test', async function() {
    //uint[] _clearImages, uint[] _blurredImages, int _lat, int _long, uint _price, string _desc, address _receiver, uint _violation_type
    var clearImages = [1234,2345,3456,4567];
    var blurredImages = [1111,2222,3333,4444];
    var lat = 42000000;
    var lon = -73000000;
    var price = "1000000000000000000"; // 1 ether, in wei
    var desc = "hello";
    var creator = "0xf17f52151EbEF6C7334FAD080c5704D77216b732";
    var receiver = "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef";
    var violation_type = 1;

    evid = await Evidence.new(clearImages, blurredImages, lat, lon, price, desc, creator, receiver, violation_type)
  })

  it('passes a trivial test', async () => {
    assert.equal(3, 3)

    console.log([a1, a2])
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
