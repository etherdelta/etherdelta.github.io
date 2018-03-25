/* This module was module number 572 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./smart_contract/token.sol.json
*/
module.exports = [
    {
        constant: !0,
        inputs: [],
        name: 'name',
        outputs: [{ name: '', type: 'string' }],
        type: 'function',
    },
    {
        constant: !1,
        inputs: [
            { name: '_spender', type: 'address' },
            { name: '_value', type: 'uint256' },
        ],
        name: 'approve',
        outputs: [{ name: 'success', type: 'bool' }],
        type: 'function',
    },
    {
        constant: !0,
        inputs: [],
        name: 'totalSupply',
        outputs: [{ name: 'supply', type: 'uint256' }],
        type: 'function',
    },
    {
        constant: !1,
        inputs: [
            { name: '_from', type: 'address' },
            { name: '_to', type: 'address' },
            { name: '_value', type: 'uint256' },
        ],
        name: 'transferFrom',
        outputs: [{ name: 'success', type: 'bool' }],
        type: 'function',
    },
    {
        constant: !0,
        inputs: [],
        name: 'decimals',
        outputs: [{ name: '', type: 'uint256' }],
        type: 'function',
    },
    {
        constant: !0,
        inputs: [{ name: '_owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        type: 'function',
    },
    {
        constant: !1,
        inputs: [
            { name: '_to', type: 'address' },
            { name: '_value', type: 'uint256' },
        ],
        name: 'transfer',
        outputs: [{ name: 'success', type: 'bool' }],
        type: 'function',
    },
    {
        constant: !0,
        inputs: [
            { name: '_owner', type: 'address' },
            { name: '_spender', type: 'address' },
        ],
        name: 'allowance',
        outputs: [{ name: 'remaining', type: 'uint256' }],
        type: 'function',
    },
    {
        anonymous: !1,
        inputs: [
            { indexed: !0, name: '_from', type: 'address' },
            { indexed: !0, name: '_to', type: 'address' },
            { indexed: !1, name: '_value', type: 'uint256' },
        ],
        name: 'Transfer',
        type: 'event',
    },
    {
        anonymous: !1,
        inputs: [
            { indexed: !0, name: '_owner', type: 'address' },
            { indexed: !0, name: '_spender', type: 'address' },
            { indexed: !1, name: '_value', type: 'uint256' },
        ],
        name: 'Approval',
        type: 'event',
    },
            ];