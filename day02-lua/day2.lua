-- move to score:
local ROCK = 1
local PAPER = 2
local SCISSORS = 3

-- round_result to score:
local LOSE = 0
local DRAW = 3
local WIN = 6

-- letter to round_result
local round_result = {
    ["X"] = LOSE,
    ["Y"] = DRAW,
    ["Z"] = WIN
}

-- letter to move:
local move_value = {
    ["A"] = ROCK,
    ["B"] = PAPER,
    ["C"] = SCISSORS,
    ["X"] = ROCK,
    ["Y"] = PAPER,
    ["Z"] = SCISSORS
}

-- move to winning_response
local winning_response = {
    [ROCK] = PAPER,
    [PAPER] = SCISSORS,
    [SCISSORS] = ROCK
}

-- inverse of winning_response
local losing_response = {
    [ROCK] = SCISSORS,
    [PAPER] = ROCK,
    [SCISSORS] = PAPER
}

function get_round_score_from_move_and_response(move, response)
    local move_score = move_value[move]
    local response_score = move_value[response]
    if move_score == response_score then
        return DRAW + response_score
    end

    if winning_response[move_score] == response_score then
        return WIN + response_score
    end

    return LOSE + response_score
end

function get_round_score_from_move_and_result(move, result)
    local move_score = move_value[move]
    local desired_result = round_result[result]
    if desired_result == DRAW then
        return DRAW + move_score
    end

    if desired_result == WIN then
        return WIN + winning_response[move_score]
    end

    return LOSE + losing_response[move_score]
end

local final_score1 = 0
local final_score2 = 0
for line in io.lines('input.txt') do
    final_score1 = final_score1 + get_round_score_from_move_and_response(line:sub(1, 1), line:sub(3, 3))
    final_score2 = final_score2 + get_round_score_from_move_and_result(line:sub(1, 1), line:sub(3, 3))
end

print('Answer for task 1', final_score1)
print('Answer for task 2', final_score2)

-- Verdict: Lua felt weird and with its 1-based indexing, "end"s all over the place, tables that have to be instanciated empty and inability to quickly split a string without using regex; not a fan :/
