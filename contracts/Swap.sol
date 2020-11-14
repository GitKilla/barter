pragma solidity ^0.6.0;

import "../openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";

contract Swap {

    address public owner;
    uint public offerCount;
    

    struct TradeOffer {
        address offerer;
        //address asker;
        uint[] offer;
        uint[] ask;
        address[] offerContract;
        address[] askContract;
        uint offerLength;
        uint askLength;
        uint offerVal;
        uint askVal;
        State state;
    }

    enum State {Active, Closed}
    mapping(address => bool) public approvedERC721;
    mapping(uint => TradeOffer) public offers;
    mapping(address => uint[]) public offersByAddress; 
    mapping(address => uint) public offerCountByAddress;
    mapping(address => uint[]) public offersCreatedByAddress; 
    mapping(address => uint) public offersCreatedCountByAddress;

    event LogOfferAdded(uint offerAddedId);
    event LogOfferAccepted(uint offerAcceptedId);
    event LogNFTApproval(address contractAddressApproved);
    event LogNFTRemoval(address contractAddressRemoved);


    modifier onlyOwner (address _address) {require(_address == owner); _;}

    constructor() public {
       owner = msg.sender;
       offerCount = 0;
    }

    function approveNFT(address _NFTContract) public onlyOwner(msg.sender) {
        emit LogNFTApproval(_NFTContract);
        approvedERC721[_NFTContract] = true;
    }

    function removeNFT(address _NFTContract) public onlyOwner(msg.sender) {
        emit LogNFTRemoval(_NFTContract);
        approvedERC721[_NFTContract] = false;
    }

    function addOffer(uint[] memory _offer, address[] memory _offerContract
                    , uint[] memory _ask, address[] memory _askContract
                    , uint _offerVal, uint _askVal, address _targetAddress) public returns (bool) {

        require(_offer.length >= 1 || _ask.length >= 1, "Offer must include at least one NFT");
        require(_offer.length == _offerContract.length, "NFT IDs (offer) array must be the same size as the contract array");
        require(_ask.length == _askContract.length, "NFT IDs (ask) array must be the same size as the contract array");
        for(uint i = 0; i < _offer.length; i++) {
            ERC721 con = ERC721(_offerContract[i]);
            require(con.ownerOf(_offer[i]) == msg.sender, "Offerer does not own NFT");
            require(con.isApprovedForAll(msg.sender, address(this)), "Offerer has not approved the contract to send NFTs");
        }

        emit LogOfferAdded(offerCount);
        offersByAddress[_targetAddress].push(offerCount);
        offerCountByAddress[_targetAddress] = offerCountByAddress[_targetAddress]+1;
        offersCreatedByAddress[msg.sender].push(offerCount);
        offersCreatedCountByAddress[msg.sender] = offersCreatedCountByAddress[msg.sender]+1;
        offers[offerCount] = TradeOffer({offerer: msg.sender
          //  , asker: _targetAddress
            , offer: _offer
            , offerContract:_offerContract
            , ask: _ask
            , askContract:_askContract
            , offerLength:_offer.length
            , askLength:_ask.length
            , offerVal: _offerVal
            , askVal:_askVal
            , state: State.Active});
        offerCount = offerCount + 1;
        
        return true;
    }

    function acceptOffer(uint _offerId) public returns (bool) {
        require(offers[_offerId].offerer != 0x0000000000000000000000000000000000000000, "Offerer must not be the burn address");
        require(offers[_offerId].state == State.Active, "Offer must be active");
       // require(offers[_offerId].asker == msg.sender, "Offer can only be accepted by intended recipient");
        
        for(uint i = 0; i < offers[_offerId].ask.length; i++) {
            ERC721 con = ERC721(offers[_offerId].askContract[i]);
            require(con.ownerOf(offers[_offerId].ask[i]) == msg.sender, "User attempting to accept offer without owning the NFTs");
            require(con.isApprovedForAll(msg.sender, address(this)), "User accepting offer has not approved the contract to send NFTs");
            con.safeTransferFrom(msg.sender, offers[_offerId].offerer, offers[_offerId].ask[i]);
        }
        for(uint i = 0; i < offers[_offerId].offer.length; i++) {
            ERC721 con = ERC721(offers[_offerId].askContract[i]);
            con.safeTransferFrom(offers[_offerId].offerer, msg.sender, offers[_offerId].offer[i]);
        }
        emit LogOfferAccepted(_offerId);
        offers[_offerId].state = State.Closed;
    }

    function cancelOffer(uint _offerId) public returns (bool) {
        require(offers[_offerId].offerer == msg.sender, "Only the offerer can cancel an offer");
        offers[_offerId].state = State.Closed;
    }

    function getOfferFromOffer(uint _offerId, uint _index) public view returns (uint) {
        TradeOffer memory off = offers[_offerId];
        return off.offer[_index];
    }

    function getOfferFromAsk(uint _offerId, uint _index) public view returns (uint) {
        TradeOffer memory off = offers[_offerId];
        return off.ask[_index];
    }

    function getOfferLengthFromOffer(uint _offerId) public view returns (uint) {
        TradeOffer memory off = offers[_offerId];
        return off.offerLength;
    }

    function getOfferLengthFromAsk(uint _offerId) public view returns (uint) {
        TradeOffer memory off = offers[_offerId];
        return off.askLength;
    }

    function getOfferState(uint _offerId) public view returns (bool) {
        TradeOffer memory off = offers[_offerId];
        if (off.state == State.Active) {
            return true;
        } else {
            return false;
        }
    }

}