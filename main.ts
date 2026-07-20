microUtilities.togglePixel(2, 1)
game.splash(microUtilities.cpuSpeed() + "mhz")
game.splash(microUtilities.ramCapacity(StorageUnit.Kilobytes) + "kb ram")
game.splash(microUtilities.storageCapacity(StorageUnit.Kilobytes) + "kb storage")
game.splash(microUtilities.storageUsage(StorageUnit.Kilobytes) + "kb used")
game.splash(microUtilities.ramUsage(StorageUnit.Kilobytes) + "kb ram used")
if (microUtilities.isMicrobit()) {
    game.splash("you r microbit")
}