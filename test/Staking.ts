/* global describe it before ethers network */
/* eslint prefer-const: "off" */

//@ts-ignore
import { ethers, network } from "hardhat";

import {Timidan,Staking} from "../typechain-types"
import { expect } from "chai";
import { BigNumber, Signer } from "ethers";
import { log } from "console";



const staked=ethers.utils.parseEther('100')
describe("Testing Baazaar Recipient", async function () {
    let Timidan:Timidan
    let Staking:Staking
    let signer:Signer
    let signer2address
    let signer2
  before(async function () {
    const deployers=await ethers.getSigners()
    const ti=await ethers.getContractFactory("Timidan")
    Timidan=await ti.deploy(deployers[0].address) as Timidan
 signer2=deployers[1];
    //deploying Staking
    const st=await ethers.getContractFactory("Staking",signer2)
    Staking=await st.deploy(Timidan.address) as Staking
    signer2address=signer2.address

  });

  it("Should Fuel the contract and signer2", async function () {
await Timidan.transfer(signer2address,staked)
await Timidan.transfer(Staking.address,ethers.utils.parseEther('50000'))

const signerBalance=await Timidan.balanceOf(signer2address)
const stakingbalance=await Timidan.balanceOf(Staking.address)

expect(signerBalance).to.equal(staked)
expect(stakingbalance).to.equal(ethers.utils.parseEther('50000'))
   
  });

  it("Should allow people to stake", async function () {
   await Timidan.connect(signer2).approve(Staking.address,ethers.utils.parseEther("1000000000000"));
   await Staking.stake(staked)

   //confirm balance
   expect((await Staking.getUser(signer2address)).stakedAmount).to.equal(staked)

  });

  it("Should allow people to withdraw their stake", async function () {
    await ethers.provider.send("evm_increaseTime", [2592000]);
    await ethers.provider.send("evm_mine", []);
    await Staking.unstake(0)
 
    const signerBalance=await Timidan.balanceOf(signer2address)
    console.log(signerBalance.toString());
    console.log((staked.div(10)).toString());
    
    
    expect(signerBalance).to.closeTo(staked.div(10),staked.div(10).sub(ethers.utils.parseEther("0.03")))
    // //confirm balance
    // expect((await Staking.getUser(signer2address)).stakedAmount).to.equal(staked)
 
   });

});