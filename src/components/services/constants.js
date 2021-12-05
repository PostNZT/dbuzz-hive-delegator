export const HIVE_100_PERCENT = 10000
export const HIVE_1_PERCENT = 100
export const HIVE_REVERSE_AUCTION_WINDOW_SECONDS_HF21 = 300
export const HIVE_REVERSE_AUCTION_WINDOW_SECONDS_HF20 = 900
export const HIVE_REVERSE_AUCTION_WINDOW_SECONDS_HF6 = 1800
export const HIVE_CONTENT_REWARD_PERCENT_HF16 = 7500
export const HIVE_CONTENT_REWARD_PERCENT_HF21 = 6500 
export const HIVE_DOWNVOTE_POOL_PERCENT_HF21 = 2500
export const HIVE_VOTE_REGENERATION_SECONDS = 432000
export const HIVE_VOTING_MANA_REGENERATION_SECONDS = 432000
export const HIVE_VOTE_DUST_THRESHOLD = 50000000
export const HIVE_ROOT_POST_PARENT = ''
export const HIVE_RC_REGEN_TIME = 60 * 60 * 24 * 5

export const STATE_BYTES_SCALE = 10000
export const STATE_TRANSACTION_BYTE_SIZE = 174
export const STATE_TRANSFER_FROM_SAVINGS_BYTE_SIZE = 229
export const STATE_LIMIT_ORDER_BYTE_SIZE = 1940
export const EXEC_FOLLOW_CUSTOM_OP_SCALE = 20
export const RC_DEFAULT_EXEC_COST = 100000
export const STATE_COMMENT_VOTE_BYTE_SIZE = 525

export const CURVE_CONSTANT = 2000000000000
export const CURVE_CONSTANT_X4 = 4 * CURVE_CONSTANT
export const SQUARED_CURVE_CONSTANT = CURVE_CONSTANT * CURVE_CONSTANT

export const STATE_OBJECT_SIZE_INFO = {
    'authority_base_size': 4 * STATE_BYTES_SCALE,
    'authority_account_member_size': 18 * STATE_BYTES_SCALE,
}