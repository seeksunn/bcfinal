const assert = require("assert");
const ganache = require("ganache-cli");
const fs = require("fs");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const bytecode = fs.readFileSync('./build/__contract_campaign_sol_Campaign.bin');
const abi = JSON.parse(fs.readFileSync('./build/__contract_campaign_sol_Campaign.abi'));
var accounts;
var campaign;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts()
    campaign = await
    new web3.eth.Contract(abi)
        .deploy({
            data: '0x'+bytecode,
            arguments: [300,accounts[0]]
        }).send({
            from: accounts[0],
            gas:'1000000'
    });
//console.log(accounts);
});

describe('campaign',() => {
    it('deploys a campaign contract', () => {
        //console.log('address: '+campaign.options.address);
        assert.ok(campaign.options.address);
    });    
    it('test createRequest()',async ()=> {
        var pass = "ok"
        try {
            await campaign.methods.createRequest('testdesc',100,accounts[1]).send({from: accounts[0],gas: 1000000});        
        } catch (err) {
            console.log(err)
            pass = "not ok";
        }
        assert.strictEqual("ok", pass);
    });
    it('only campaign creator can createRequest()',async ()=> {
        var pass = "ok"
        try {
            await campaign.methods.createRequest('testdesc',100,accounts[1]).send({from: accounts[2],gas: 1000000});        
        } catch (err) {
            pass = "not ok";
        }
        assert.strictEqual("not ok", pass);
    });
     it('test contribute()',async ()=> {
        var pass = "ok"
        try {
            await campaign.methods.contribute().send({from: accounts[2],value: web3.utils.toWei("400", "wei")});
        } catch (err) {
            pass = "not ok";
        }
        assert.strictEqual("ok", pass);
    });
    it('require minimum wei to contribute()',async ()=> {
        var pass = "ok"
        try {
            await campaign.methods.contribute().send({from: accounts[3],value: web3.utils.toWei("299", "wei")});        
        } catch (err) {
            pass = "not ok";
        }
        assert.strictEqual("not ok", pass);
    });
    it('test approveRequest()',async ()=> {
        var pass = "ok"
        try {
            await campaign.methods.createRequest('testdesc',100,accounts[1]).send({from: accounts[0],gas: 1000000});       
            await campaign.methods.contribute().send({from: accounts[2],value: web3.utils.toWei("400", "wei")});
            await campaign.methods.approveRequest(0).send({from: accounts[2]});        
        } catch (err) {
            console.log(err);
            pass = "not ok";
        }
        assert.strictEqual("ok", pass);
    });    
    it('require to be contributer to approveRequest()',async ()=> {
        var pass = "ok"
        try {
            await campaign.methods.createRequest('testdesc',100,accounts[1]).send({from: accounts[0],gas: 1000000});       
            await campaign.methods.contribute().send({from: accounts[2],value: web3.utils.toWei("400", "wei")});
            await campaign.methods.approveRequest(0).send({from: accounts[3]});        
        } catch (err) {
            pass = "not ok";
        }
        assert.strictEqual("not ok", pass);
    });
    it('check if approver call approveRequest() more than once',async ()=> {
        var pass = "ok"
        try {
            await campaign.methods.createRequest('testdesc',100,accounts[1]).send({from: accounts[0],gas: 1000000});       
            await campaign.methods.contribute().send({from: accounts[2],value: web3.utils.toWei("400", "wei")});
            await campaign.methods.approveRequest(0).send({from: accounts[2]});
            await campaign.methods.approveRequest(0).send({from: accounts[2]});      
        } catch (err) {
            pass = "not ok";
        }
        assert.strictEqual("not ok", pass);
    });
    it('test finalizeRequest()',async ()=> {
        var pass = "ok"
        try {
            await campaign.methods.createRequest('testdesc',100,accounts[1]).send({from: accounts[0],gas: 1000000});       
            await campaign.methods.contribute().send({from: accounts[2],value: web3.utils.toWei("400", "wei")});
            await campaign.methods.approveRequest(0).send({from: accounts[2]});        
            await campaign.methods.finalizeRequest(0).send({from: accounts[0]});        
        } catch (err) {
            console.log(err);
            pass = "not ok";
        }
        assert.strictEqual("ok", pass);
    });
    
    it('approver of request must more than 50% of all approver in campaign to finalizeRequest() ',async ()=> {
        var pass = "ok"
        try {
            await campaign.methods.createRequest('testdesc',100,accounts[1]).send({from: accounts[0],gas: 1000000});       
            await campaign.methods.contribute().send({from: accounts[2],value: web3.utils.toWei("400", "wei")});
            await campaign.methods.contribute().send({from: accounts[3],value: web3.utils.toWei("400", "wei")});
            await campaign.methods.contribute().send({from: accounts[4],value: web3.utils.toWei("400", "wei")});
            await campaign.methods.approveRequest(0).send({from: accounts[2]});            
            await campaign.methods.finalizeRequest(0).send({from: accounts[0]});        
        } catch (err) {
            pass = "not ok";
        }
        assert.strictEqual("not ok", pass);
    });
    it('test finalizeRequest() the completed request',async ()=> {
        var pass = "ok"
        try {
            await campaign.methods.createRequest('testdesc',100,accounts[1]).send({from: accounts[0],gas: 1000000});       
            await campaign.methods.contribute().send({from: accounts[2],value: web3.utils.toWei("400", "wei")});
            await campaign.methods.approveRequest(0).send({from: accounts[2]});        
            await campaign.methods.finalizeRequest(0).send({from: accounts[0]});        
            await campaign.methods.finalizeRequest(0).send({from: accounts[0]});        
        } catch (err) {
            pass = "not ok";
        }
        assert.strictEqual("not ok", pass);
    });    
});
