sudo yum update
sudo yum install git
sudo git clone https://github.com/SpencerKasper/gamble-bot.git
sudo chown -R $USER:$USER ./
curl -sL https://rpm.nodesource.com/setup_6.x | sudo -E bash -
yum install nodejs --enablerepo=nodesource