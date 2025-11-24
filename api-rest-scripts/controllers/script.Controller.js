import execute_vpn from "../scripts/execute_vpn.js";

export const scriptHandlers = {

    execute_vpn: async function (req, res) {

        let data = req.body

        try {

            await execute_vpn(data.token)
            return res.status(200).send({ flag: true });

        } catch (error) {
            return res.status(400).send({ flag: false, message: error.message })
        }

    },

}